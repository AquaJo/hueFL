document
  .getElementById('btn_back_ipFinderRes')
  .addEventListener('click', btnBackIpFinderRes);
document
  .getElementById('btn_continue_ipFinderRes')
  .addEventListener('click', btnContinueIpFinderRes);
function btnBackIpFinderRes() {
  ipFinderResPage.style.display = 'none';
  welcomePage.style.display = 'block';
}
function btnContinueIpFinderRes() {
  let btnContinue = document.getElementById('btn_continue_ipFinderRes');
  if (btnContinue.className === 'btn btn-success') {
    // if button is green --> so ip finding was successful
    ipFinderResPage.style.display = 'none';
    initializeBridgeAuth();
  }
}
