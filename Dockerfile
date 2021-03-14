FROM node:latest

RUN mkdir -p /usr/src/hangout
WORKDIR /usr/src/hangout

# Create User
RUN groupadd -r app && useradd -r -g app app

COPY package.json package.json
# Load all requirements
RUN npm install
# grant access rights on node_modules and package* files
RUN chown app:app -R /usr/src/hangout/


COPY . /usr/src/hangout/
# grant access rights on all project files (excluding node_modules)
RUN ls /usr/src/hangout/ | grep -v node_modules | xargs -n1 chown app:app -R


USER app
CMD ["npm", "start"]

EXPOSE 5000
