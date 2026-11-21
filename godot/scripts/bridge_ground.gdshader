shader_type canvas_item;
render_mode unshaded;

uniform sampler2D soil : source_color, repeat_enable, filter_linear;
uniform vec2 repeats = vec2(3.3, 5.03);

void fragment() {
	vec4 shore = texture(TEXTURE, UV);
	vec3 dirt = texture(soil, UV * repeats).rgb;
	COLOR = vec4(dirt * shore.r, shore.a);
}
