# Use Node v4 as the base image.
FROM node:6

# Author
MAINTAINER Diarmuid Lane

# Add everything in the current directory to our image, in the 'app' folder.
ADD package.json /app/
ADD spgdh-entrypoint.sh /app/
ADD src /app/src
ADD test /app/test
# Install dependencies
RUN npm config set registry http://npm.tecnotree.com
RUN cd /app/; \
    npm install
    #npm install --production


#EXPOSE 8080
# Run our app.
ENTRYPOINT ["bash","/app/spgdh-entrypoint.sh"]
CMD ["--llevel=normal"]
