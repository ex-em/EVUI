#!/usr/bin/env sh

puts() { printf %s\\n "$*" ;}

hook_dir=".git\hooks"
tracked_dir="githooks"
hook_name="pre-commit"
#requested_hook="$1"
#default_hooks="pre-commit"

if [ ! -d ".git" ]; then
   puts 'You must be in the root directory of a `git` project to use this script!' >&2
   exit 1;
fi

cd $(git rev-parse --show-toplevel)

mkdir -p "$hook_dir"

install_hook() {
	#hook_name="$1"

	puts "Installing '$hook_name' hooks ..." >&2

	# If the primary hook-file exists, and isn't a symlink, then we need to move it out of the way.
	if [ ! -h "$hook_dir/$hook_name" -a -x "$hook_dir/$hook_name" ]; then
		puts "Moving original '$hook_name' to '$hook_name-local' ..." >&2
		mv "$hook_dir/$hook_name" "$hook_dir/$hook_name-local" || exit 1;
	fi

	# If it still exists now, it's either already a symlink or not executable. Either way, don't care
	rm "$hook_dir/$hook_name" 2>/dev/null

	#Now, we link the hook-chaining script to process these hooks
	#ln -s "../../$tracked_dir/chain-hooks.sh" "$hook_dir/$hook_name"

	# For each tracked hook in the repository, 
	for tracked_path in "$tracked_dir/$hook_name"; do		
		if [ ! -x "$tracked_path" ]; then 
			chmod +x "$tracked_path"
		fi

		hook_path="$hook_dir/$(basename "$tracked_path")"		
		puts " - '$hook_path' ..." >&2

		# ... remove any existing symlink,
		if [ -L "$hook_path" ]; then
			rm $hook_path
		fi

		# ... and create a symlink to the tracked version of the hook.
		#ln -s "../../$tracked_path" "$hook_path" || exit 1   
		./$tracked_dir/install_hooks.bat "$tracked_dir\\$hook_name" "$hook_dir\\$hook_name"
	done
}

install_hook


#if [ -n "$requested_hook" ]; then
#   install_hook $requested_hook
#else
#	for default_hook in $default_hooks; do
#   		install_hook $default_hook
#	done
#fi