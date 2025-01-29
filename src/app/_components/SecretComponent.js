import React from "react";

const SecretComponent = ({ secret, setSecret, handleUpdateSecret }) => {
    return (
        <div>
            <input
                type="text"
                placeholder="Secret Message"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
            />
            <button onClick={handleUpdateSecret}>Update Secret</button>
        </div>
    );
};

export default SecretComponent;
