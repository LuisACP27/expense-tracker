// Firebase Debug Helper
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si Firebase está correctamente inicializado
    if (typeof firebase === 'undefined') {
        console.error('Firebase no está definido. Asegúrate de que los scripts de Firebase estén cargados correctamente.');
        showErrorMessage('Error de inicialización de Firebase. Verifica la consola para más detalles.');
        return;
    }

    // Verificar si la autenticación de Firebase está disponible
    if (typeof firebase.auth === 'undefined') {
        console.error('Firebase Auth no está disponible. Asegúrate de cargar firebase-auth-compat.js.');
        showErrorMessage('Error en el módulo de autenticación. Verifica la consola para más detalles.');
        return;
    }

    // Verificar si la configuración de Firebase es válida
    try {
        const currentApp = firebase.app();
        console.log('Firebase inicializado correctamente:', currentApp.name);
        
        // Verificar si la autenticación con Google está habilitada
        firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
            .catch(error => {
                if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
                    console.error('La autenticación con Google no está habilitada en la consola de Firebase.');
                    showErrorMessage('La autenticación con Google no está configurada correctamente. Verifica la consola para más detalles.');
                }
                // No mostramos errores para cancelaciones intencionales del usuario
                if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
                    console.error('Error al intentar autenticar con Google:', error.code, error.message);
                }
            });
    } catch (error) {
        console.error('Error al inicializar Firebase:', error);
        showErrorMessage('Error de configuración de Firebase. Verifica la consola para más detalles.');
    }

    // Función para mostrar mensajes de error en la UI
    function showErrorMessage(message) {
        // Crear elemento de mensaje de error
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.bottom = '20px';
        errorDiv.style.left = '20px';
        errorDiv.style.right = '20px';
        errorDiv.style.padding = '15px';
        errorDiv.style.backgroundColor = '#f44336';
        errorDiv.style.color = 'white';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.zIndex = '9999';
        errorDiv.style.textAlign = 'center';
        errorDiv.textContent = message;
        
        // Agregar botón para cerrar
        const closeButton = document.createElement('span');
        closeButton.textContent = '×';
        closeButton.style.marginLeft = '15px';
        closeButton.style.float = 'right';
        closeButton.style.fontWeight = 'bold';
        closeButton.style.fontSize = '22px';
        closeButton.style.lineHeight = '20px';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = function() {
            document.body.removeChild(errorDiv);
        };
        
        errorDiv.appendChild(closeButton);
        document.body.appendChild(errorDiv);
    }
}); 