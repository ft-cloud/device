FROM node:latest AS BUILD_IMAGE

COPY ./package*.json /src/

WORKDIR /src
ARG mode="prod"

RUN if [ "${mode}" = "dev" ] ; then npm install ; else npm install --production ; fi

EXPOSE 3000

COPY . /src


FROM node:17-alpine
COPY --from=BUILD_IMAGE /src .

CMD if [ "$mode" = "dev" ] ; then npm run debug ; else npm run start ; fi