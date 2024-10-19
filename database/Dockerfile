FROM mariadb:11.2.5-jammy

# Copy your custom my.cnf to the container's configuration directory
COPY ./50-server.cnf /etc/mysql/mariadb.conf.d/50-server.cnf

# Expose MariaDB port
EXPOSE 3306
