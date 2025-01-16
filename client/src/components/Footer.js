import React from 'react';

const Footer = () => {
    return (
        <>
            <footer className="container">
                <div className="container text-center text-md-left">
                    <div className="row text-center text-md-left">
                        <div className="mt-3 col-lg-4 col-xl-4">
                            <h5 className="font-weight-bold mb-4 text-uppercase">O nás</h5>
                            <hr className="mb-4" />
                            <p>
                                Jsme online autobazar zaměřený výhradně na sportovní auta. Uživatelé si zde mohou založit účet a následně inzerovat své vozy.
                            </p>
                        </div>
                        <div className="mt-3 col-lg-4 col-xl-4">
                            <h5 className="font-weight-bold mb-4 text-uppercase">Kontakt</h5>
                            <hr className="mb-4" />
                            <p>
                                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" className="bi bi-telephone me-2" viewBox="0 0 16 16">
                                    <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z" />
                                </svg>
                                +420 776 322 046
                            </p>
                            <p>
                                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" className="bi bi-envelope me-2" viewBox="0 0 16 16">
                                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z" />
                                </svg>
                                sportovniautainfo@gmail.com
                            </p>
                        </div>
                        <div className="mt-3 col-lg-4 col-xl-4">
                            <h5 className="font-weight-bold mb-4 text-uppercase">Sociální Média</h5>
                            <hr className="mb-4" />
                            <p>
                                <a href="https://www.instagram.com/sportovni_auta_ig/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="#C13584" className="bi bi-instagram me-2" viewBox="0 0 16 16">
                                        <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.466a3.25 3.25 0 1 0 3.25 3.25 3.25 3.25 0 0 0-3.25-3.25z" />
                                    </svg>
                                    Instagram
                                </a>
                            </p>
                            <p>
                                <a href="https://www.facebook.com/people/Sportovn%C3%AD-Auta/pfbid05ZM78vu5eowdhDgc8NADxbNSCqqAWEod9dMtzb7rKHJYc6ifvCAnVstZNZT9iPGel/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="#4267B2" className="bi bi-facebook me-2" viewBox="0 0 16 16">
                                        <path d="M16 8a8 8 0 1 0-9.464 7.93V10.4H5.5V8h1.036V6.293C6.536 4.26 7.79 3.5 9.298 3.5c1.1 0 1.92.082 2.181.12v2.548h-1.5c-1.197 0-1.429.56-1.429 1.376V8h2.863l-.335 2.4H9.5v5.53A8 8 0 0 0 16 8z" />
                                    </svg>
                                    Facebook
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;