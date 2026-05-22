/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   structures.hpp                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: praucq <praucq@student.s19.be>             +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/22 09:34:42 by praucq            #+#    #+#             */
/*   Updated: 2026/05/22 10:13:52 by praucq           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#pragma once

#include <string>
#include "controls.hpp"

typedef struct s_appearance
{
	int _bodytype;
	int	_skin;
    int	_face;
	int	_hair;
	int	_top1;
	int	_top2;
	int	_bot1;
	int _bot2;
	int _hand;
	int _feet;

	std::string badge;
	std::string title;

} t_appearance;

typedef struct s_options
{
	t_controls_map*	ctrl_map;
	int				sound;
	

} t_options;

typedef struct s_loc
{
	double	x;
	double	y;
	double	angle;
	double	calc_x;
	double	calc_y;
	double	dir;
	int		index_x;
	int		index_y;
}	t_loc;


typedef struct s_stats
{	
	//alive (1 by default)

	//LEVEL
	//XP
	//req_XP

	//MHP
	//HP
	//MMP
	//MP
	//ATK
	//DEF
	//INT
	//MDF
	//resistance ?
	//SPD
	//EVA

	//GOD_MODE
} t_stats;
