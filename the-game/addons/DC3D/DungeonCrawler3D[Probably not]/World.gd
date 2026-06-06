extends Node3D

const Cell = preload("res://addons/DC3D/DungeonCrawler3D[Probably not]/cell/cell.tscn")

@export var Map: PackedScene

var cells = []

func _ready() -> void:
	var map = Map.instantiate()
	var tile_map = map.get_tilemap()
	var used_tiles = tile_map.get_used_cells()
	map.free()
	for tile in used_tiles:
		var cell = Cell.instantiate()
		add_child(cell)
		cells.append(cell)
		cell.global_transform.origin = Vector3(tile.x*1, 0, tile.y*1)
	for cell in cells:
		cell.update_faces(used_tiles)
