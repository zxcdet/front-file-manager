const imageWrapper = document.getElementById('image-wrapper');
await getAllImage();
document.getElementById('urlImageBtn').addEventListener('click', () => {
  const imageUrl = document.getElementById('urlImageControl').value.trim();
  fetch(`http://localhost:3000/proxy?url=${imageUrl}`, {
    method: 'GET',
  })
    .then((response) => {
      if (!response.ok) throw new Error('Cannot download image');
      return response.blob();
    })
    .then(async (blob) => {
      blob.name = `new-image.${blob.type.split('/')[1]}`;
      const formData = new FormData();
      const resizedFile = await resizeElement(blob);
      formData.append('image', resizedFile);
      return await fetch('http://localhost:3000/save-image', {
        method: 'POST',
        body: formData,
      });
    })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Cannot download image to server');
      }
      await getAllImage();
      return response.json();
    })
    .catch((error) => {
      console.error(error);
    });
});

const controlUpload = document.getElementById('file-upload');
controlUpload.addEventListener('change', (event) => {
  const files = event.target.files;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size > 2 * 1024 * 1024) {
      alert('2 mb limit');
      controlUpload.value = '';
      break;
    }
  }
});

document.getElementById('filesBtn').addEventListener('click', async () => {
  const fileInput = document.getElementById('file-upload');
  const files = fileInput.files;

  if (files.length > 0) {
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      const resizedFile = await resizeElement(files[i]);
      formData.append('files', resizedFile);
    }

    try {
      await fetch('http://localhost:3000/save-files', {
        method: 'POST',
        body: formData,
      });
      await getAllImage();
    } catch (error) {
      console.error(error);
    }
  }
});

async function setImageList(links) {
  imageWrapper.innerHTML = '';
  for (const link of links) {
    if (await isImageValid(link)) {
      const image = document.createElement('img');
      image.src = link;
      imageWrapper.insertAdjacentElement('beforeend', image);
    }
  }
}

async function isImageValid(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

function resizeElement(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = function () {
      const maxDimension = 500;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((maxDimension / width) * height);
          width = maxDimension;
        }
      } else if (height > maxDimension) {
        width = Math.round((maxDimension / height) * width);
        height = maxDimension;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const resizedImgUrl = canvas.toDataURL(file.type || 'image/jpeg');
      resolve(dataURLtoFile(resizedImgUrl, file.name));
    };

    img.onerror = reject;
  });
}

function dataURLtoFile(dataUrl, filename) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

async function getAllImage() {
  try {
    const response = await fetch('http://localhost:3000/image-urls', {
      method: 'GET',
    });
    const data = await response.json();
    await setImageList(data);
  } catch (error) {
    console.error(error);
  }
}
