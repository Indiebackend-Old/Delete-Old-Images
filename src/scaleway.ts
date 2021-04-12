import fetch from "node-fetch";
import * as core from "@actions/core";
import {config} from "dotenv";
config();

const BASE_URL = "https://api.scaleway.com/registry/v1/regions/fr-par/";
const TOKEN = core.getInput("scwtoken") || process.env.SCW_TOKEN || "";
const NAMESPACE_ID = "9366b4e1-8d79-4caf-8685-6c315183c051";

export async function listImages(): Promise<Image[]> {
	return (await scaleway(`images?page_size=100&namespace_id=${NAMESPACE_ID}`))
		.images;
}

export async function listTags(): Promise<Image[]> {
	const images = await listImages();
	return await Promise.all(
		images.map(async e => {
			e.tags = (await scaleway(`images/${e.id}/tags`)).tags;
			return e;
		}),
	);
}

export async function deleteTags(tagIds: string[]) {
	return await Promise.all(tagIds.map(e => scaleway(`tags/${e}`, "DELETE")));
}

async function scaleway(endpoint: string, method = "GET") {
	const res = await (
		await fetch(`${BASE_URL}/${endpoint}`, {
			headers: {
				"x-auth-token": TOKEN,
			},
			method,
		})
	).json();
	return res;
}

export interface Image {
	id: string;
	name: string;
	namespace_id: string;
	status: string;
	status_message: string;
	visibility: string;
	size: number;
	created_at: string;
	updated_at: string;
	tags: Tag[];
}

export interface Tag {
	id: string;
	name: string;
	image_id: string;
	status: string;
	digest: string;
	created_at: string;
	updated_at: string;
}
