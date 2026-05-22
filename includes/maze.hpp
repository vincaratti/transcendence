/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   maze.hpp                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: praucq <praucq@student.s19.be>             +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/22 09:30:19 by praucq            #+#    #+#             */
/*   Updated: 2026/05/22 09:30:24 by praucq           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#pragma once

#include "entity.hpp"

class maze
{
private:
	int			maze_level;
	entity**	entity_list;
	//structure that represent the layout, double array ?
	//structure that stores the textures.

public:
	maze();
	maze(int level);
	maze(int level, size_t size);
	maze(int level, int maze_ID);
	~maze();

	void		random_maze_generator(size_t size, int type, int lvl);

	entity**	get_entity_list();
	entity*		get_entity(int entity_ID);

	void		del_dead();
	void		del_entity(int entity_ID);
};
