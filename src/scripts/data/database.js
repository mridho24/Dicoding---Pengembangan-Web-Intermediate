import { openDB } from "idb";

const DATABASE_NAME = "cerita-kitadb";
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = "saved-reports";

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
    upgrade: (database) => {
        database.createObjectStore(OBJECT_STORE_NAME, {
            keyPath: "id",
        });
    },
});

const Database = {
    async putReport(report) {
        if (!Object.hasOwn(report, "id")) {
            throw new Error("`id` is required to save.");
        }
        return (await dbPromise).put(OBJECT_STORE_NAME, report);
    },

    async getReportById(id) {
        if (!id) {
            throw new Error("`id` is required.");
        }
        return (await dbPromise).get(OBJECT_STORE_NAME, id);
    },

    async getAllReports() {
        return (await dbPromise).getAll(OBJECT_STORE_NAME);
    },

    async removeReport(id) {
        return (await dbPromise).delete(OBJECT_STORE_NAME, id);
    },

    async saveStory(story) {
        if (!story.id) {
            throw new Error("Story ID is required");
        }

        // Check if story already exists
        const existingStory = await this.getReportById(story.id);
        if (existingStory) {
            throw new Error("Story already saved");
        }

        return this.putReport(story);
    },

    async isStorySaved(id) {
        if (!id) {
            throw new Error("Story ID is required");
        }
        const story = await this.getReportById(id);
        return !!story;
    },
};

export default Database;
