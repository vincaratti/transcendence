/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   player.hpp                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: praucq <praucq@student.s19.be>             +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/22 09:50:50 by praucq            #+#    #+#             */
/*   Updated: 2026/05/22 09:58:39 by praucq           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#pragma once

class player : public entity
{
private:
	bool				_admin;
	bool				_banned;
	long				_muted;

public:
	player(int player_ID);
	~player();

	void				heal(int amount);
	void				deal(int skill_ID, entity& target);
	void				bedamaged(int amount, entity& attacker);
	void				receive_xp(int amount);
	void				check_death();

	void				stats_menu();
	void				allocate_stat_point(int stat_id);
};
