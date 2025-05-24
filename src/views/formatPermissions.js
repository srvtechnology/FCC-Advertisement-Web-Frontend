// helpers/formatPermissions.js
export const formatPermissions = (permissions) => {
    const formattedPermissions = {};

    permissions.forEach(permission => {
        const { module, action } = permission;

        // If the module doesn't exist in the permissions object, create a new Set for actions
        if (!formattedPermissions[module]) {
            formattedPermissions[module] = new Set();
        }

        // Add the action to the set for the respective module
        formattedPermissions[module].add(action);
    });

    return formattedPermissions;
  };
  