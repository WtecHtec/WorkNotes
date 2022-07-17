function initOptEvent() {
	$('#wtechtec_opt').on("click", () => {
		$('#hz_loading').show();
		initFabricCanvas();
		requestAnimationFrame(() => {
			$('#hz_loading').hide();
		})
	});
}