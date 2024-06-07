const selectFile = (onFileLoad: (content: string) => void, typeFile: string) => {
  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const fileList = input.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      const fileExtension = file.name.split('.').pop();
      if (fileExtension === typeFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && event.target.result) {
            const content = event.target.result as string;
            onFileLoad(content);
          }
        };
        reader.readAsText(file);
      } else {
        alert(`Por favor, selecione um arquivo ${typeFile}`);
      }
    }
  };

  const openFileDialog = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = `.${typeFile}`;
    input.style.display = 'none';
    input.addEventListener('change', handleFileChange);
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  openFileDialog();
};

export default selectFile;
