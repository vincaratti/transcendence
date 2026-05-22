/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   moving.hpp                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: praucq <praucq@student.s19.be>             +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/22 10:05:40 by praucq            #+#    #+#             */
/*   Updated: 2026/05/22 10:36:27 by praucq           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#pragma once

#include "entity.hpp"
#include "maze.hpp"

void	walking(entity& entity, maze& maze);
int		moving(entity& entity, maze& maze);
int		region_detection(entity& entity, maze& maze);
void	collision_detect_corner(maze& maze, int region, int ind_x, int ind_y);
void	collision_detection(entity& entity, maze& maze);
void	collision_simple(entity& entity, maze& maze, int region, int ind_x, int ind_y);
void	collision_corner(entity& entity, maze& maze, int region, int ind_x, int ind_y);