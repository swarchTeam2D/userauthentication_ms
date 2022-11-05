const ldap = require("ldapjs");

async function loginLDAP(user, password) {
  user = "cn=" + user + ",ou=sa,dc=aware,dc=unal,dc=edu,dc=co";

  let response = await validateLogin(user, password);

  return response;
}

async function validateLogin(user, password) {
  const client = ldap.createClient({
    url: "ldap://host.docker.internal:389",
  });

  return new Promise((resolve, reject) => {
    client.bind(user, password, function (err) {
      if (err) {
        return resolve(false);
      }
      return resolve(true);
    });
  });
}

module.exports = loginLDAP;
