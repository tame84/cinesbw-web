<script lang="ts">
	interface Props {
		text: string;
		name: string;
		checked: boolean;
		onclick: () => void;
	}

	let { text, name, checked, onclick } = $props();
</script>

<label>
	<input type="checkbox" {name} {checked} {onclick} />
	{text}
</label>

<style lang="scss">
	@use '$lib/styles/vars.scss' as *;

	label {
		padding: 0.5rem 0.75rem;
		border: $border;
		border-radius: 500px;
		font-size: 0.875rem;
		color: $fg-muted;
		display: grid;
		place-items: center;
		cursor: pointer;

		&:has(:checked) {
			border-color: $fg;
			color: $fg;
		}

		&:hover {
			background: $bg-lighter;
		}
	}
</style>
