async function getCommunicatorJSON() {
  let res = await api.send('getCommunicatorJSON');
  return res;
}
async function setCommunicatorJSON(obj) {
  return await api.send('setCommunicatorJSON', [obj]);
}
async function launchOneTimeJavaAmbiances() {
  return await api.send('startJavaProgram');
}
