const imgInput = document.getElementById("image");

imgInput.addEventListener("change", (e) => {
  previewMultiple(e);
});

function previewMultiple(event) {
  // select imgPreview div where imgs will be displayed:
  const imgPreview = document.getElementById("imgPreview");
  // clear previous images:
  imgPreview.innerHTML = "";
  // loop over files and add to imgPreview div:
  for (i = 0; i < event.target.files.length; i++) {
    const urls = URL.createObjectURL(event.target.files[i]);
    const fileName = event.target.files[i].name;
    imgPreview.innerHTML += `<figure class="figure mt-4 col-4 col-lg-3 d-flex flex-column align-items-center">
<img class="img-thumbnail object-fit-cover" src="${urls}"><figcaption class="figure-caption">${fileName}</figcaption></figure>
`;
  }
}
