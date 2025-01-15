import axios from 'axios';
import { toast } from 'react-hot-toast';

function checkAuth(navigate) {
    axios.get('http://localhost:3001/check', { withCredentials: true })
      .then(res => {
        if (res.data.Status === "Success") {
          
        } else {
          navigate("/");
        }
      })
      .catch(error => {
        toast.error("Došlo k chybě při náčítání stránky profilu. " + error);
      });
}

export default checkAuth;