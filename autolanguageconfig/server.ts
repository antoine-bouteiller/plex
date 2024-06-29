import Fastify from "fastify";
import "dotenv/config";
import { updateTvShowsLanguage } from "./routes/tv";
import { updateMoviesLanguage } from "./routes/movies";

const fastify = Fastify({
	logger: true,
});

fastify.post("/tv", async (request, reply) => {
	request.log.info("Processing tv shows");
	await updateTvShowsLanguage(request);
	reply.send("ok");
});

fastify.post("/movies", async (request, reply) => {
	request.log.info("Processing movies");
	await updateMoviesLanguage(request);
	reply.send("ok");
});

const start = async () => {
	try {
		await fastify.listen({ port: 3000 });
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
