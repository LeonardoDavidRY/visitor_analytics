import axios from "axios";

const consultarDatosAPI = async()=>{
    try {
        const response = await axios.get("https://5ea4-186-69-112-160.ngrok-free.app/api/datos").then(res => res.data);
        return response;
    } catch (error) {
        console.error("Error al consultar los datos de la API:", error);
        throw error;
    }
}

export default {
    consultarDatosAPI
};