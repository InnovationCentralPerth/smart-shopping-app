# Author: Basil Toufexis 11/11/2025
# basil2fxs@gmail.com
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List, Dict, Tuple, Optional
import math
import heapq
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AISLE_SECTIONS = {
    "1": "walkway", "2": "walkway", "3": "walkway", "4": "walkway", "5": "walkway",
    "6": "bakery", "7": "deli", "8": "produce"
}

POSITION_COORDS = {
    "1": {
        "A": {"x": 220, "y": 70},
        "B": {"x": 350, "y": 70},
        "C": {"x": 480, "y": 70},
        "D": {"x": 280, "y": 105},
        "E": {"x": 520, "y": 105}
    },
    "2": {
        "A": {"x": 220, "y": 155},
        "B": {"x": 350, "y": 155},
        "C": {"x": 480, "y": 155},
        "D": {"x": 280, "y": 190},
        "E": {"x": 520, "y": 190}
    },
    "3": {
        "A": {"x": 220, "y": 240},
        "B": {"x": 350, "y": 240},
        "C": {"x": 480, "y": 240},
        "D": {"x": 280, "y": 275},
        "E": {"x": 520, "y": 275}
    },
    "4": {
        "A": {"x": 220, "y": 325},
        "B": {"x": 350, "y": 325},
        "C": {"x": 480, "y": 325},
        "D": {"x": 280, "y": 360},
        "E": {"x": 520, "y": 360}
    },
    "5": {
        "A": {"x": 220, "y": 410},
        "B": {"x": 350, "y": 410},
        "C": {"x": 480, "y": 410},
        "D": {"x": 280, "y": 445},
        "E": {"x": 520, "y": 445}
    }
}

# SPECIAL LOCATIONS - ONLY ON AISLES 1-5
SPECIAL_LOCATIONS = [
    {"aisle": "1B", "discount": 20, "x": 350, "y": 70},
    {"aisle": "2D", "discount": 15, "x": 280, "y": 190},
    {"aisle": "3A", "discount": 25, "x": 220, "y": 240},
    {"aisle": "4C", "discount": 30, "x": 480, "y": 325},
    {"aisle": "5E", "discount": 10, "x": 520, "y": 445},
]

# A* GRID SETUP
GRID_WIDTH = 760
GRID_HEIGHT = 600
GRID_RESOLUTION = 5  # Finer resolution for smoother paths

# Define obstacles - areas that are NOT WHITE
OBSTACLES = [
    # Shelves (red areas)
    {"x1": 180, "y1": 35, "x2": 620, "y2": 70},
    {"x1": 180, "y1": 105, "x2": 620, "y2": 155},
    {"x1": 180, "y1": 190, "x2": 620, "y2": 240},
    {"x1": 180, "y1": 275, "x2": 620, "y2": 325},
    {"x1": 180, "y1": 360, "x2": 620, "y2": 410},
    {"x1": 180, "y1": 445, "x2": 620, "y2": 480},
    # Bakery (orange area)
    {"x1": 32, "y1": 40, "x2": 152, "y2": 200},
    # Deli (amber area)
    {"x1": 32, "y1": 215, "x2": 152, "y2": 365},
    # Produce (green area)
    {"x1": 664, "y1": 40, "x2": 728, "y2": 320},
    # Checkout (red area)
    {"x1": 32, "y1": 420, "x2": 152, "y2": 540},
]

def is_walkable(x: int, y: int) -> bool:
    """Check if position is in WHITE walkable area"""
    if x < 15 or x >= GRID_WIDTH - 15 or y < 15 or y >= GRID_HEIGHT - 45:
        return False
    
    for obs in OBSTACLES:
        if obs["x1"] <= x <= obs["x2"] and obs["y1"] <= y <= obs["y2"]:
            return False
    
    return True

def heuristic(a: Tuple[int, int], b: Tuple[int, int]) -> float:
    """Euclidean distance heuristic"""
    dx = a[0] - b[0]
    dy = a[1] - b[1]
    return math.sqrt(dx * dx + dy * dy)

def get_neighbors(pos: Tuple[int, int]) -> List[Tuple[int, int]]:
    """Get 8-directional walkable neighbors"""
    x, y = pos
    neighbors = []
    
    directions = [
        (GRID_RESOLUTION, 0), (-GRID_RESOLUTION, 0),
        (0, GRID_RESOLUTION), (0, -GRID_RESOLUTION),
        (GRID_RESOLUTION, GRID_RESOLUTION), (-GRID_RESOLUTION, -GRID_RESOLUTION),
        (GRID_RESOLUTION, -GRID_RESOLUTION), (-GRID_RESOLUTION, GRID_RESOLUTION)
    ]
    
    for dx, dy in directions:
        nx, ny = x + dx, y + dy
        if is_walkable(nx, ny):
            neighbors.append((nx, ny))
    
    return neighbors

def astar_pathfinding(start: Tuple[int, int], goal: Tuple[int, int]) -> List[Dict[str, int]]:
    """A* pathfinding constrained to walkable (white) areas, with robust start/goal fallback."""
    # Snap to grid
    def snap(pt):
        return (round(pt[0] / GRID_RESOLUTION) * GRID_RESOLUTION,
                round(pt[1] / GRID_RESOLUTION) * GRID_RESOLUTION)

    start_grid = snap(start)
    goal_grid = snap(goal)

    # Ensure start & goal are walkable (radial probe)
    def nearest_walkable(pt):
        if is_walkable(pt[0], pt[1]):
            return pt
        for radius in range(GRID_RESOLUTION, 200, GRID_RESOLUTION):
            for angle in range(0, 360, 15):
                tx = pt[0] + int(radius * math.cos(math.radians(angle)))
                ty = pt[1] + int(radius * math.sin(math.radians(angle)))
                if is_walkable(tx, ty):
                    return (tx, ty)
        # last resort: return original
        return pt

    start_grid = nearest_walkable(start_grid)
    goal_grid  = nearest_walkable(goal_grid)

    # Early out: identical point
    if start_grid == goal_grid:
        return [{"x": start_grid[0], "y": start_grid[1]}]

    # A* search
    frontier = []
    heapq.heappush(frontier, (0.0, 0, start_grid))  # (f, tie, node)
    came_from = {start_grid: None}
    g_cost = {start_grid: 0.0}
    seen = set()
    tie = 0

    def heuristic(a, b):
        dx = a[0] - b[0]; dy = a[1] - b[1]
        return math.hypot(dx, dy)

    MAX_EXPANSIONS = 200000  # safety cap
    expansions = 0

    while frontier and expansions < MAX_EXPANSIONS:
        _, _, current = heapq.heappop(frontier)
        if current in seen:
            continue
        seen.add(current)
        expansions += 1

        if current == goal_grid:
            break

        for nx, ny in get_neighbors(current):
            nxt = (nx, ny)
            move_cost = math.hypot(nxt[0]-current[0], nxt[1]-current[1])
            new_g = g_cost[current] + move_cost
            if nxt not in g_cost or new_g < g_cost[nxt]:
                g_cost[nxt] = new_g
                tie += 1
                f = new_g + heuristic(nxt, goal_grid)
                heapq.heappush(frontier, (f, tie, nxt))
                came_from[nxt] = current

    # Reconstruct; if goal unreachable, walk back to nearest explored node to goal
    target = goal_grid
    if target not in came_from:
        # choose node with smallest h to goal among explored
        if g_cost:
            target = min(g_cost.keys(), key=lambda n: heuristic(n, goal_grid))
        else:
            return [{"x": start[0], "y": start[1]}, {"x": goal[0], "y": goal[1]}]

    path = []
    cur = target
    while cur is not None:
        path.append({"x": cur[0], "y": cur[1]})
        cur = came_from.get(cur)

    path.reverse()
    return smooth_path(path)


def smooth_path(path: List[Dict[str, int]]) -> List[Dict[str, int]]:
    """Remove unnecessary waypoints for smoother paths"""
    if len(path) <= 2:
        return path
    
    smoothed = [path[0]]
    i = 0
    while i < len(path) - 1:
        for j in range(len(path) - 1, i, -1):
            if can_draw_straight_line(path[i], path[j]):
                smoothed.append(path[j])
                i = j
                break
        else:
            i += 1
            if i < len(path):
                smoothed.append(path[i])
    
    return smoothed

def can_draw_straight_line(p1: Dict[str, int], p2: Dict[str, int]) -> bool:
    """Check if straight line stays in walkable area"""
    steps = int(max(abs(p2["x"] - p1["x"]), abs(p2["y"] - p1["y"])) / GRID_RESOLUTION)
    if steps == 0:
        return True
    
    for i in range(steps + 1):
        t = i / steps
        x = int(p1["x"] + t * (p2["x"] - p1["x"]))
        y = int(p1["y"] + t * (p2["y"] - p1["y"]))
        if not is_walkable(x, y):
            return False
    
    return True

def parse_aisle(aisle_str):
    """Parse aisle string"""
    if not aisle_str:
        return ("1", "A")
    aisle_num = aisle_str[0]
    position = aisle_str[1] if len(aisle_str) > 1 else "A"
    return (aisle_num, position)

def get_item_coords(aisle_str):
    """Get coordinates - items placed ABOVE text for sections"""
    aisle_num, position = parse_aisle(aisle_str)
    
    # Special sections - ABOVE text
    if aisle_num == "6":
        return {"x": 90, "y": 90}  # Above bakery text
    elif aisle_num == "7":
        return {"x": 90, "y": 250}  # Above deli text
    elif aisle_num == "8":
        return {"x": 690, "y": 140}  # Above produce text
    
    if aisle_num in POSITION_COORDS and position in POSITION_COORDS[aisle_num]:
        return POSITION_COORDS[aisle_num][position]
    
    return {"x": 400, "y": 300}

def distance(p1, p2):
    """Calculate distance"""
    dx = p1["x"] - p2["x"]
    dy = p1["y"] - p2["y"]
    return math.sqrt(dx * dx + dy * dy)

def calculate_total_distance_astar(waypoints: List[Tuple[int, int]]) -> float:
    """Calculate total distance using A* between ALL waypoints"""
    total = 0
    for i in range(len(waypoints) - 1):
        path = astar_pathfinding(waypoints[i], waypoints[i + 1])
        for j in range(len(path) - 1):
            total += distance(path[j], path[j + 1])
    return total

def optimize_route_tsp_astar(items_with_locs, start_pos, max_iterations=300):
    """TSP with A* distance calculation"""
    if len(items_with_locs) <= 2:
        return items_with_locs
    
    # Nearest neighbor initial route
    current_route = []
    current_pos = start_pos
    remaining = items_with_locs.copy()
    
    while remaining:
        nearest = min(remaining, 
                     key=lambda i: distance(current_pos, {"x": i["shelf_x"], "y": i["shelf_y"]}))
        current_route.append(nearest)
        remaining.remove(nearest)
        current_pos = {"x": nearest["shelf_x"], "y": nearest["shelf_y"]}
    
    # 2-opt optimization
    best_route = current_route.copy()
    waypoints = [(start_pos["x"], start_pos["y"])]
    waypoints.extend([(item["shelf_x"], item["shelf_y"]) for item in best_route])
    best_distance = calculate_total_distance_astar(waypoints)
    
    improved = True
    iterations = 0
    
    while improved and iterations < max_iterations:
        improved = False
        iterations += 1
        
        for i in range(1, len(best_route) - 1):
            for j in range(i + 1, len(best_route)):
                new_route = best_route[:i] + best_route[i:j+1][::-1] + best_route[j+1:]
                new_waypoints = [(start_pos["x"], start_pos["y"])]
                new_waypoints.extend([(item["shelf_x"], item["shelf_y"]) for item in new_route])
                new_distance = calculate_total_distance_astar(new_waypoints)
                
                if new_distance < best_distance:
                    best_route = new_route
                    best_distance = new_distance
                    improved = True
                    break
            
            if improved:
                break
    
    return best_route

def calculate_route(items, mode="fastest"):
    """Main route calculation with FULL A* pathfinding for entire trip."""
    # 1) Map input items to shelf coords
    items_with_locs = []
    for item in items:
        coords = get_item_coords(item.get("aisle", ""))
        items_with_locs.append({
            **item,
            "shelf_x": coords["x"],
            "shelf_y": coords["y"]
        })

    start_pos = {"x": 380, "y": 570}

    # 2) Build ordered waypoint list
    if mode == "specials":
        # Force route through ALL specials first (mandatory waypoints)
        specials_with_locs = []
        for sp in SPECIAL_LOCATIONS:
            coords = get_item_coords(sp["aisle"])
            specials_with_locs.append({
                "is_special": True,
                "special_location": sp["aisle"],
                "shelf_x": coords["x"],
                "shelf_y": coords["y"],
                "discount": sp["discount"],
                "name": f"Special: {sp['discount']}% OFF",
                "aisle": sp["aisle"],
                "price": 0,
                "stock": 0,
            })

        # Optimize specials order from entrance
        specials_order = optimize_route_tsp_astar(specials_with_locs, start_pos)

        # Optimize items starting from the LAST special visited
        if specials_order:
            last_sp = specials_order[-1]
            items_order = optimize_route_tsp_astar(
                items_with_locs,
                {"x": last_sp["shelf_x"], "y": last_sp["shelf_y"]}
            )
        else:
            items_order = optimize_route_tsp_astar(items_with_locs, start_pos)

        ordered = specials_order + items_order

    elif mode == "fastest":
        # Express: optimize items only
        ordered = optimize_route_tsp_astar(items_with_locs, start_pos)

    else:  # custom/manual order fallback
        ordered = items_with_locs

    # 3) Build FULL path with A* segment-by-segment
    route = []
    full_path = []
    current_pos = (start_pos["x"], start_pos["y"])

    for idx, item in enumerate(ordered, 1):
        item_pos = (item["shelf_x"], item["shelf_y"])

        segment_path = astar_pathfinding(current_pos, item_pos)

        # Deduplicate seam between segments
        if full_path and segment_path:
            if full_path[-1]["x"] == segment_path[0]["x"] and full_path[-1]["y"] == segment_path[0]["y"]:
                full_path.extend(segment_path[1:])
            else:
                full_path.extend(segment_path)
        else:
            full_path.extend(segment_path)

        item["waypoint_number"] = idx
        item["path_to_item"] = segment_path
        route.append(item)
        current_pos = item_pos

    # 4) Checkout leg (still A*)
    checkout_pos = (90, 480)
    checkout_path = astar_pathfinding(current_pos, checkout_pos) if route else []

    # 5) Distance tally
    def distance(p1, p2):
        dx = p1["x"] - p2["x"]; dy = p1["y"] - p2["y"]
        return math.sqrt(dx*dx + dy*dy)

    total_dist = 0.0
    for i in range(len(full_path) - 1):
        total_dist += distance(full_path[i], full_path[i+1])
    for i in range(len(checkout_path) - 1):
        total_dist += distance(checkout_path[i], checkout_path[i+1])

    return {
        "items": route,
        "checkout_path": checkout_path,
        "full_path": full_path,
        "start": start_pos,
        "specials": SPECIAL_LOCATIONS,
        "total_distance": round(total_dist, 2),
        "optimization_applied": True,
        "pathfinding": "A* complete trip",
    }


@app.get("/")
async def root():
    return FileResponse(os.path.join(_static_dir, "index.html"))

@app.post("/api/shopping-list")
async def post_list(items: List[Dict], mode: str = "fastest"):
    data = calculate_route(items, mode)
    return {**data, "mode": mode, "total_items": len(data["items"])}

@app.get("/api/specials")
async def get_specials():
    return {"specials": SPECIAL_LOCATIONS}

# Serve static frontend files — must be registered after API routes
_static_dir = os.path.dirname(os.path.abspath(__file__))
app.mount("/", StaticFiles(directory=_static_dir, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
