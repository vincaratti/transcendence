/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   classes.hpp                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: praucq <praucq@student.s19.be>             +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/15 13:49:32 by praucq            #+#    #+#             */
/*   Updated: 2026/05/15 15:05:53 by praucq           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include <string>

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

} t_appearance;

typedef struct s_options
{
	

} t_options;


class profile
{
private:
	std::string 	_pseudo;
	int				_ID;
	t_appearance*	_custom;
	std::string 	_picName; //Would be stored in database, with only a generated name here.
	t_options*		_options;


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





typedef struct s_loc
{
	//x
	//y
	//angle
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

class entity
{
private:
	t_appearance*	_appearance;
	std::string		_pseudo;
	t_stats*		_stats;
	t_loc*			_location;

	//class object skillbook to be made and included here;

public:
	entity(/* args */);
	~entity();

	const std::string&	get_pseudo();
	const t_appearance* get_appearance();
	t_stats*			get_stats();
	t_loc*				get_loc();

	void				move();

	virtual void	heal(int amount) = 0;
	virtual void	deal(int skill_ID, entity& target) = 0;
	virtual void	bedamaged(int amount, entity& attacker) = 0;
	virtual void	receive_xp(int amount) = 0;
	virtual void	check_death() = 0;
};

class player : public entity
{
private:

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


class map
{
private:
	int			map_level;
	entity**	entity_list;
	//structure that represent the layout, double array ?
	//structure that stores the textures.

public:
	map();
	map(int level);
	map(int level, int size);
	map(int level, int map_ID);
	~map();

	void		random_maze_generator(int size, int type);

	entity**	get_entity_list();
	entity*		get_entity(int entity_ID);

	void		del_dead();
	void		del_entity(int entity_ID);
};
