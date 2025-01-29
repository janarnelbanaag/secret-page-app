import React from "react";

const DelLogoutBtn = ({ handleLogout, handleDeleteAccount, id }) => {
    return (
        <div>
            <button onClick={handleLogout}>Logout</button>
            <button onClick={() => handleDeleteAccount(id)}>
                Delete Account
            </button>
        </div>
    );
};

export default DelLogoutBtn;
