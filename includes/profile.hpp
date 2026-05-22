/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   profile.hpp                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: praucq <praucq@student.s19.be>             +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/15 13:49:32 by praucq            #+#    #+#             */
/*   Updated: 2026/05/22 09:41:20 by praucq           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#pragma once

#include "structures.hpp"

class profile
{
private:
	std::string 	_pseudo;
	int				_ID;
	t_appearance*	_custom;
	std::string 	_picName; //Would be stored in database, with only a generated name here.
	t_options*		_options;

	bool			_admin;
	bool			_connected;
	bool			_banned;
	long			_muted;


public:
	profile(/* args */);
	~profile();

	int save_to_database();	//will be called each time we change something in the profile and save.
							//return 0 if all is fine.

	const std::string&	get_pseudo();
	void				set_pseudo(std::string& n_pseudo);
	int					get_ID();	//no set_ID(), it will be set in the constructor and non-changeable.
	const std::string&	ID_to_string();	//expressed in hex format.
	t_appearance*		get_appearance();
	t_options*			get_options();


	void				appearance_menu();										//Open the appearance customization menu, copy the saved appearance in a temp struct.
	void				modify_appearance(t_appearance* n_appear, int part, int id);	//modify the temp struct.
	void				save_appearance(t_appearance* n_appear);						//eventually save the temp struct.

	void				options_menu();
	void				modify_options(int setting_id, int setting_level);

	void				get_pic();							//NO CLUE ABOUT HOW TO RETURN THE ACTUAL IMAGE YET, see later.
	void				set_pic(std::string& pic_path);
};










