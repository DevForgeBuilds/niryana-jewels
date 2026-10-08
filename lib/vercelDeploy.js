// =====================================================================================
// Minimal Vercel REST API helper used ONLY by the admin "reset password" flow, to make
// a self-service password reset actually take effect in production (the admin password
// lives in the ADMIN_PASSWORD environment variable, not a database, so "resetting" it
// means updating that env var and redeploying so the running app picks up the change).
//
// Requires VERCEL_TOKEN, VERCEL_PROJECT_ID, VERCEL_TEAM_ID as server-only env vars.
// If they're not configured, resetPassword() throws and the API route surfaces a clear
// error instead of silently pretending the reset worked.
// =====================================================================================

const API = "https://api.vercel.com";

function requireConfig() {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!token || !projectId || !teamId) {
    throw new Error(
      "Self-service password reset isn't configured on the server (missing VERCEL_TOKEN/VERCEL_PROJECT_ID/VERCEL_TEAM_ID)."
    );
  }
  return { token, projectId, teamId };
}

async function vercelFetch(path, { token, method = "GET", body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `Vercel API request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

async function findEnvVarId({ token, projectId, teamId }, key) {
  const data = await vercelFetch(`/v10/projects/${projectId}/env?teamId=${teamId}`, { token });
  const match = (data.envs || []).find((e) => e.key === key);
  if (!match) throw new Error(`Couldn't find the ${key} environment variable on Vercel.`);
  return match.id;
}

async function updateEnvVar({ token, projectId, teamId }, envId, key, value) {
  await vercelFetch(`/v9/projects/${projectId}/env/${envId}?teamId=${teamId}`, {
    token,
    method: "PATCH",
    body: { key, target: ["production"], type: "encrypted", value },
  });
}

async function latestReadyProductionDeploymentId({ token, projectId, teamId }) {
  const data = await vercelFetch(
    `/v6/deployments?projectId=${projectId}&teamId=${teamId}&target=production&state=READY&limit=1`,
    { token }
  );
  const dep = (data.deployments || [])[0];
  if (!dep) throw new Error("Couldn't find an existing production deployment to redeploy from.");
  return dep.uid;
}

async function triggerRedeploy({ token, teamId }, deploymentId, projectName) {
  await vercelFetch(`/v13/deployments?teamId=${teamId}&forceNew=1`, {
    token,
    method: "POST",
    body: { name: projectName, deploymentId, target: "production" },
  });
}

// Updates ADMIN_PASSWORD on Vercel and kicks off a redeploy so it takes effect.
// Resolves once the redeploy has been *triggered* (not once it's finished — that
// takes ~30-60s, which the caller should communicate to the user).
export async function resetAdminPasswordInProduction(newPassword) {
  const config = requireConfig();
  const envId = await findEnvVarId(config, "ADMIN_PASSWORD");
  await updateEnvVar(config, envId, "ADMIN_PASSWORD", newPassword);
  const deploymentId = await latestReadyProductionDeploymentId(config);
  await triggerRedeploy(config, deploymentId, "niryana-jewels");
}
