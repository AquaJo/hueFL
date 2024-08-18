import { createApp } from 'vue';
import UpdateMain from './updates/UpdateMain.vue';
const updatesButton = document.getElementById('updates');
let app = createApp(UpdateMain).mount(
  document.getElementById('updatesContentMain')
);
updatesButton.addEventListener('click', function () {
  app.start();
});
