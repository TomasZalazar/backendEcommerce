document.addEventListener('DOMContentLoaded', () => {
    const formElement = document.getElementById('formulario-producto');

    formElement.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Recoger datos del formulario
        const nuevoProducto = {
            title: document.getElementById('nombre-producto').value,
            description: document.getElementById('descripcion-producto').value,
            category: document.getElementById('categoria-producto').value,
            price: parseFloat(document.getElementById('precio-producto').value),
            code: document.getElementById('codigo-producto').value,
            stock: parseInt(document.getElementById('stock-producto').value, 10),
        };

        // Crear un objeto FormData
        const formData = new FormData();
        formData.append('title', nuevoProducto.title);
        formData.append('description', nuevoProducto.description);
        formData.append('category', nuevoProducto.category);
        formData.append('price', nuevoProducto.price);
        formData.append('code', nuevoProducto.code);
        formData.append('stock', nuevoProducto.stock);

        // Añadir archivos de imagen si existen
        const thumbnailsInput = document.getElementById('thumbnails-producto');
        for (const file of thumbnailsInput.files) {
            formData.append('thumbnails', file);
        }

    
        const authToken ='{{authToken}}'

        try {
            // Enviar el FormData al servidor
            const response = await fetch('/api/products/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                    // No establecer el Content-Type para FormData, el navegador lo hace automáticamente
                },
                body: formData,
            });

            if (response.ok) {
                // Limpiar el formulario y emitir evento socket
                formElement.reset();
                socketClient.emit('nuevoProducto', nuevoProducto);
            } else {
                // Mostrar mensaje de error en consola
                const errorMessage = await response.json();
                console.error('Error al agregar el producto:', errorMessage);
                alert(`Error al agregar el producto: ${errorMessage.error || 'Error desconocido'}`);
            }
        } catch (error) {
            // Mostrar mensaje de error en consola
            console.error('Error al agregar el producto:', error.message);
            alert(`Error al crear el producto: ${error.message}`);
        }
    });
});
