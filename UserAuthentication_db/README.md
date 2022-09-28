# Creación de imagen

docker build -t userAuthentication_db .


# Ejecutar el contenedor

docker run --name db_user -d --link 

# Ejecutar phpmyadmin

userAuthenticacion_db:db -p 8081:80 phpmyadmin