import * as core from "@actions/core";
import {config} from "dotenv";
import {deleteTags, listTags} from "./scaleway";
config();

const excludeImages = ["dev-latest", "latest"];

const IMAGES_TO_KEEP = 3; // We keep the last 2 images

async function run(): Promise<void> {
	try {
		core.startGroup("Processing images");

		core.info("Listing images");
		const images = await listTags();

		core.info("Listing images to delete");
		const toDeleteIds: string[] = [];

		for (const img of images)
			toDeleteIds.push(
				...img.tags
					.filter(e => !excludeImages.includes(e.name))
					.sort()
					.reverse() // More performant than sorting in reverse order
					.slice(IMAGES_TO_KEEP)
					.map(e => e.id),
			),
				core.endGroup();

		core.info(`Deleting ${toDeleteIds.length}/${images.length} images`);
		await deleteTags(toDeleteIds);
	} catch (error) {
		core.setFailed(error.message);
	}
}

run();
