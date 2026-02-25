<script lang="ts">
	let { dateTime, version, cinemaName, cinemaWebsite } = $props();
</script>

<li>
	<a href={cinemaWebsite} target="_blank">
		<strong
			>{new Date(dateTime).toLocaleTimeString('fr-BE', {
				hour: '2-digit',
				minute: '2-digit'
			})}<span>{version}</span></strong
		>

		<p>{cinemaName}</p></a
	>
</li>

<style lang="scss">
	@use '$lib/styles/vars.scss' as *;

	li {
		a {
			width: 100%;
			padding: 0.5rem;
			padding-top: 2rem;
			background: $bg-light;
			border: $border;
			border-radius: $radius-sm;
			font-size: 0.875rem;
			cursor: pointer;
			transition: 0.1s ease-in;

			&:hover {
				background: $bg-lighter;
			}
		}
		strong {
			font-size: 1.5rem;
			font-weight: 500;

			span {
				font-size: 0.875rem;
				font-weight: 400;
				margin-left: 0.5rem;
			}
		}
		p {
			margin-top: 0.5rem;
			color: $fg-muted;
		}
	}
</style>
