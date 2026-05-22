/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   moving.cpp                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: praucq <praucq@student.s19.be>             +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/22 10:10:24 by praucq            #+#    #+#             */
/*   Updated: 2026/05/22 11:48:23 by praucq           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "../includes/moving.hpp"

/*
A modulo (%) specialized for PI
*/
static double	modulo_2pi(double pouf)
{
	while (pouf < 0)
		pouf += 2 * PI;
	while (pouf >= 2 * PI)
		pouf -= 2 * PI;
	return (pouf);
}

/*
Calculate the walking direction depending
on the current angle and all the inputs.
*/
static double	calculate_dir(entity& entity)
{
	double	dir;
	t_controls* ctrl = entity.get_controls();

	if (ctrl->up && ctrl->right
		&& !ctrl->left && !ctrl->down)
		return (modulo_2pi(location->angle + 7 * PI / 4));
	dir = 0;
	if (ctrl->down && !ctrl->up)
		dir = PI;
	if (ctrl->right && !ctrl->left)
	{
		if (ctrl->down && !ctrl->up)
			dir = (dir + 3 * PI / 2) / 2;
		else
			dir = 3 * PI / 2;
	}
	else if (ctrl->left && !ctrl->right)
	{
		if ((ctrl->up && !ctrl->down)
			|| (ctrl->down && !ctrl->up))
			dir = (dir + PI / 2) / 2;
		else
			dir = PI / 2;
	}
	dir = modulo_2pi(entity.get_loc()->angle + dir);
	return (dir);
}

/*
Calculates where the character should be if corresponding keys are pressed.
Then proceed to verify if he/she/they
	collided with a wall via collision_detection().
Any correction will be done in function called by the above mentioned function.
Then update the index of the cell we are now in.
*/
void	walking(entity& entity, maze& maze)
{
	double	dr;

	t_loc*	location = entity.get_loc();
	t_controls* ctrl = entity.get_controls();
	dr = calculate_dir(entity);
	if (dr == location->angle && (!ctrl->up || ctrl->down))
		return ;
	location->x_calc = location->x + ctrl->walk_speed * cos(dr);
	location->calc_y = location->y + ctrl->walk_speed * sin(dr);
	location->index_x = (int)(location->calc_x / maze->wall_size);
	location->index_y = (int)(location->calc_y / maze->wall_size);
	if (location->index_x < 1 || location->index_x >= maze->map->width
		|| location->index_y < 1 || location->index_y > maze->map->height
		|| maze->map->map[location->index_x][location->index_y] != '0')
	{
		printf("\033[%d;%dHRespawn due to phasing through ", 15, 10);
		printf("walls.\nShould this message appears at any moment, ");
		printf("it means something went wrong with our precautions.\n");
		location->index_x = maze->map->start_x;
		location->index_y = maze->map->start_y;
		location->x = (location->index_x + 0.5) * maze->wall_size;
		location->y = (location->index_y + 0.5) * maze->wall_size;
		return ;
	}
	collision_detection(entity, maze);
	location->y = location->calc_y;
	location->x = location->calc_x;
}

/*
Change the angle of view if corresponding keys are pressed.
Or if a direction key is pressed, calls walking()

The last input of walking() is the walking speed,
which remains to be determined while testing.
*/
int	moving(entity& entity, maze& maze)
{
	double	prec;

	t_loc*	location = entity.get_loc();
	t_controls* ctrl = entity.get_controls();
	prec = ROT_SPD * 0.9;
	if (ctrl->rot_left && !ctrl->rot_right)
		location->angle = modulo_2pi(location->angle + ctrl->rot_speed);
	if (ctrl->rot_right && !ctrl->rot_left)
		location->angle = modulo_2pi(location->angle - ctrl->rot_speed);
	if (location->angle < prec || location->angle > 2 * PI - prec)
		location->angle = 0;
	else if (location->angle > PI / 2 - prec && location->angle < PI / 2 + prec)
		location->angle = PI / 2;
	else if (location->angle > PI - prec && location->angle < PI + prec)
		location->angle = PI;
	else if (location->angle > 3 * PI / 2 - prec && location->angle < 3 * PI / 2 + prec)
		location->angle = 3 * PI / 2;
	if ((ctrl->up || ctrl->down
			|| ctrl->left || ctrl->right)
		&& !(ctrl->up && ctrl->down
			&& ctrl->left && ctrl->right))
		walking(entity, maze);
	return (0);
}

/*
Determine in which region the character will be standing after the movement.

In a single cell (walkable area from the map), the regions are :
432
501
678
*/
int	region_detection(entity& entity, maze& maze)
{
	double	x;
	double	y;

	t_loc*	location = entity.get_loc();
	t_controls* ctrl = entity.get_controls();
	x = modulo(location->calc_x, maze->wall_size);
	y = modulo(location->calc_y, maze->wall_size);
	if (x <= ctrl.coll_radius && y <= ctrl.coll_radius)
		return (6);
	if (x <= ctrl.coll_radius && y < maze->wall_size - ctrl.coll_radius)
		return (5);
	if (x <= ctrl.coll_radius)
		return (4);
	if (x < maze->wall_size - ctrl.coll_radius && y <= ctrl.coll_radius)
		return (7);
	if (y <= ctrl.coll_radius)
		return (8);
	if (x < maze->wall_size - ctrl.coll_radius
		&& y < maze->wall_size - ctrl.coll_radius)
		return (0);
	if (x < maze->wall_size - ctrl.coll_radius)
		return (3);
	if (y < maze->wall_size - ctrl.coll_radius)
		return (1);
	return (2);
}

/*
We start with four successive and excluding check to see if a wall is
	adjacent to our cell and weither we collided with it.
	If so, we call collision_simple().
We then verify if we collided with a sharp corner,
	and if so, we call collision_corner.
*/
void	collision_detect_corner(maze& maze, int region, int ind_x, int ind_y)
{
	if (region == 2 && (maze->map->map[ind_x][ind_y + 1] == '1'
		|| maze->map->map[ind_x + 1][ind_y] == '1'))
		collision_simple(simu, region, ind_x, ind_y);
	else if (region == 4 && (maze->map->map[ind_x][ind_y + 1] == '1'
		|| maze->map->map[ind_x - 1][ind_y] == '1'))
		collision_simple(simu, region, ind_x, ind_y);
	else if (region == 6 && (maze->map->map[ind_x][ind_y - 1] == '1'
		|| maze->map->map[ind_x - 1][ind_y] == '1'))
		collision_simple(simu, region, ind_x, ind_y);
	else if (region == 8 && (maze->map->map[ind_x][ind_y - 1] == '1'
		|| maze->map->map[ind_x + 1][ind_y] == '1'))
		collision_simple(simu, region, ind_x, ind_y);
	else if (region == 2 && maze->map->map[ind_x + 1][ind_y + 1] == '1')
		collision_corner(simu, region, ind_x, ind_y);
	else if (region == 4 && maze->map->map[ind_x - 1][ind_y + 1] == '1')
		collision_corner(simu, region, ind_x, ind_y);
	else if (region == 6 && maze->map->map[ind_x - 1][ind_y - 1] == '1')
		collision_corner(simu, region, ind_x, ind_y);
	else if (region == 8 && maze->map->map[ind_x + 1][ind_y - 1] == '1')
		collision_corner(simu, region, ind_x, ind_y);
}

/*
Determine if we might collide with a wall in a "simple manner".
If so, calls collision_simple().

Note : a "simple manner" means their is one
	and only one possible wall to worry about.
If we are in the cell's corner, use more complex checks
	via collision_detect_corner().
*/
void	collision_detection(entity& entity, maze& maze)
{
	int		ind_x;
	int		ind_y;
	double	coll_radius;
	int		region;

	t_loc*	location = entity.get_loc();
	t_controls* ctrl = entity.get_controls();
	region = region_detection(simu);
	if (!region)
		return ;
	ind_x = location->index_x;
	ind_y = location->index_y;
	coll_radius = ctrl.coll_radius;
	if (region % 2)
	{
		if (region == 1 && maze->map->map[ind_x + 1][ind_y] == '1')
			collision_simple(simu, region, ind_x, ind_y);
		else if (region == 3 && maze->map->map[ind_x][ind_y + 1] == '1')
			collision_simple(simu, region, ind_x, ind_y);
		else if (region == 5 && maze->map->map[ind_x - 1][ind_y] == '1')
			collision_simple(simu, region, ind_x, ind_y);
		else if (region == 7 && maze->map->map[ind_x][ind_y - 1] == '1')
			collision_simple(simu, region, ind_x, ind_y);
	}
	else
		collision_detect_corner(simu, region, ind_x, ind_y);
}

/*
Collision with a wall directly adjacent to the current cell.
Does allow for collisions with two walls in the cell corner.
*/
void	collision_simple(entity& entity, maze& maze, int region, int ind_x, int ind_y)
{
	double	coll_radius;

	t_loc*	location = entity.get_loc();
	t_controls* ctrl = entity.get_controls();
	coll_radius = ctrl.coll_radius;
	if ((region == 4 || region == 3 || region == 2)
		&& maze->map->map[ind_x][ind_y + 1] == '1')
		location->calc_y = (ind_y + 1) * maze->wall_size - coll_radius;
	if ((region == 2 || region == 1 || region == 8)
		&& maze->map->map[ind_x + 1][ind_y] == '1')
		location->calc_x = (ind_x + 1) * maze->wall_size - coll_radius;
	if ((region == 6 || region == 7 || region == 8)
		&& maze->map->map[ind_x][ind_y - 1] == '1')
		location->calc_y = ind_y * maze->wall_size + coll_radius;
	if ((region == 4 || region == 5 || region == 6)
		&& maze->map->map[ind_x - 1][ind_y] == '1')
		location->calc_x = ind_x * maze->wall_size + coll_radius;
}

/*
After colliding with the sharp corner,
we determine the side on which we will stand after the correction.
To do so, we "simply" check weither we are closer to
the non-colliding area of one side or the other an pick accordingly.
*/
void	collision_corner(entity& entity, maze& maze, int region, int ind_x, int ind_y)
{
	double	cell;
	double	radius;
	double	x;
	double	y;

	t_loc*	location = entity.get_loc();
	t_controls* ctrl = entity.get_controls();
	cell = maze->wall_size;
	radius = ctrl.coll_radius;
	x = location->calc_x;
	y = location->calc_y;
	if (region == 2 && modulo(x, cell) <= modulo(y, cell))
		location->calc_x = (ind_x + 1) * cell - radius;
	else if (region == 2)
		location->calc_y = (ind_y + 1) * cell - radius;
	else if (region == 6 && modulo(x, cell) >= modulo(y, cell))
		location->calc_x = (ind_x) * cell + radius;
	else if (region == 6)
		location->calc_y = (ind_y) * cell + radius;
	else if (region == 8 && cell - modulo(x, cell) >= modulo(y, cell))
		location->calc_x = (ind_x + 1) * cell - radius;
	else if (region == 8)
		location->calc_y = (ind_y) * cell + radius;
	else if (region == 4 && modulo(x, cell) >= cell - modulo(y, cell))
		location->calc_x = (ind_x) * cell + radius;
	else if (region == 4)
		location->calc_y = (ind_y + 1) * cell - radius;
}
