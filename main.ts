import { Plugin } from "obsidian";
import TagSuggest from "TagSuggest";

export default class FrontmatterTagSuggestPlugin extends Plugin {
	async onload() {
		this.registerEditorSuggest(new TagSuggest(this));
	}
}
