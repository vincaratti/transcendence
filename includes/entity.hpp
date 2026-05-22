/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   entity.hpp                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: praucq <praucq@student.s19.be>             +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/22 09:33:10 by praucq            #+#    #+#             */
/*   Updated: 2026/05/22 10:37:43 by praucq           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#pragma once

#include "structures.hpp"

class entity
{
private:
	t_appearance*	_appearance;
	std::string		_pseudo;
	t_stats*		_stats;
	t_loc*			_location;
	t_controls*		_ctrl;
	maze*			_curr_maze;

	// UUID or differencianting

	//class object skillbook to be made and included here;

public:
	entity(/* args */);
	~entity();

	const std::string&	get_pseudo();
	const t_appearance* get_appearance();
	t_stats*			get_stats();
	t_loc*				get_loc();
	t_controls*			get_controls();

	void				move();

	virtual void	heal(int amount) = 0;
	virtual void	deal(int skill_ID, entity& target) = 0;
	virtual void	bedamaged(int amount, entity& attacker) = 0;
	virtual void	receive_xp(int amount) = 0;
	virtual void	check_death() = 0;
};

class mob : public entity
{
private:
	

public:
	mob(int type, int level);
	~mob();

	void				heal(int amount);
	void				deal(int skill_ID, entity& target);
	void				bedamaged(int amount, entity& attacker);
	void				receive_xp(int amount);
	void				check_death();
};
