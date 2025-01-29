import axios from 'axios';

function checkAuth(navigate) {
    return new Promise((resolve, reject) => {
        axios.get('http://localhost:3001/check', { withCredentials: true })
            .then(res => {
                if (res.data.Status !== "Success") {
                    navigate("/");
                }
                resolve();
            })
    });
}

export default checkAuth;