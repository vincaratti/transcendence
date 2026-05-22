/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   entity.cpp                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: praucq <praucq@student.s19.be>             +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/22 09:42:20 by praucq            #+#    #+#             */
/*   Updated: 2026/05/22 10:43:41 by praucq           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "../includes/entity.hpp"
#include "../includes/moving.hpp"

//Puting the constructors and destructors as pure virtual functions mayhaps ?
//	Since there could be conflict in setting the appearance unless we define each player as a single member species...
entity::entity(/* args */);
entity::~entity();

const std::string&	entity::get_pseudo()
{
	return (_pseudo);
}

const t_appearance* entity::get_appearance()
{
	return (_appearance);
}

t_stats*			entity::get_stats()
{
	return (_stats);
}

t_loc*				entity::get_loc()
{
	return (_location);
}

t_controls*	entity::get_controls()
{
	return (_ctrl);
}

void	entity::move()
{
	moving(*this, _curr_maze);
}



