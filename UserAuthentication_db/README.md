# Creación de imagen

docker build -t userauthentication_db .

# Ejecutar el contenedor

docker run -d -t -i -p 33061:33061 --name userauthentication_db userauthentication_db

# Ejecutar phpmyadmin

docker run --name db_user -d --link userauthentication_db:db -p 8081:80 phpmyadmin