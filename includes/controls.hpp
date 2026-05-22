/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   controls.hpp                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: praucq <praucq@student.s19.be>             +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/22 09:47:16 by praucq            #+#    #+#             */
/*   Updated: 2026/05/22 10:44:26 by praucq           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#pragma once

typedef struct s_controls_map
{
	char up;
	char down;
	char left;
	char right;
	char rot_left;
	char rot_right;
}	t_controls_map;

typedef struct s_controls
{
	bool up;
	bool down;
	bool left;
	bool right;
	bool rot_left;
	bool rot_right;

	double walk_speed;
	double rot_speed;
	double coll_radius;
}	t_controls;
