#!/usr/bin/env ruby
name = Time.now.to_i
repo = Git.open(".")
repo.add_tag(name)
repo.push("origin", name)
puts "Created tag: #{name}"