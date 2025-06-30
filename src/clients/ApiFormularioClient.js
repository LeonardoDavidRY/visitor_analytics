import axios from "axios";

const consultarDatosAPI = async()=>{
    try {
        // Añadir headers necesarios para ngrok
        const response = await axios.get("https://4586-186-69-112-160.ngrok-free.app/api/datos", {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error al consultar los datos de la API:", error);
        throw error;
    }
}

export default {
    consultarDatosAPI
};