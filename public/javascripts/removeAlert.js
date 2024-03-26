document.addEventListener("DOMContentLoaded", function () {
  const successAlert = document.getElementById("successAlert");
  // const errorAlert = document.getElementById("errorAlert");

  if (successAlert) {
    setTimeout(function () {
      successAlert.remove();
    }, 5000);
  }

  // if (errorAlert) {
  //   setTimeout(function () {
  //     errorAlert.remove();
  //   }, 5000);
  // }
});
