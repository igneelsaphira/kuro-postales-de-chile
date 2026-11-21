shader_type canvas_item;
render_mode unshaded;

uniform vec2 light_uv = vec2(0.5, 0.65);
uniform vec2 viewport_size = vec2(1100.0, 619.0);
uniform float camera_zoom = 1.0;
uniform float shade = 1.0;

void fragment() {
	float radius = length((UV - light_uv) * viewport_size) / camera_zoom;
	float near_shade = 0.43 * smoothstep(55.0, 95.0, radius);
	float far_shade = 0.49 * smoothstep(95.0, 165.0, radius);
	float edge_shade = 0.08 * smoothstep(165.0, 235.0, radius);
	COLOR = vec4(vec3(0.006, 0.009, 0.016), (near_shade + far_shade + edge_shade) * shade);
}
