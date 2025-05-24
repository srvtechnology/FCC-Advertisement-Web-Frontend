// helpers/getUserPermissions.js
import axiosClient from "../axios-client";

export const getUserPermissions = async () => {
    try {
        const response = await axiosClient.get('/user-permissions', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`, // adjust if needed
            },
        });

        // console.log('Fetched permissions:', response.data.data);

        if (response.data.success) {
            return response.data.data; // this should be array of { module, action }
        }

        return [];
    } catch (error) {
        console.error('Error fetching permissions:', error);
        return [];
    }
};
