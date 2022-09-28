# Creación de la imagen

docker build -t userauthentication_ms .

# Despliegue del contenedor

docker run -p 3000:3000 -e DB_HOST=host.docker.internal -e DB_PORT=33061 -e DB_USER=userauthentication -e DB_PASSWORD=2022 -e DB_NAME=userauthentication_db -e URL=0.0.0.0:3000 userauthentication_ms