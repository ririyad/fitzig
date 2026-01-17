import { mutation } from './_generated/server';

// Seed system exercises
export const seedExercises = mutation({
	args: {},
	handler: async (ctx) => {
		// Check if exercises already exist
		const existingExercises = await ctx.db
			.query('exercises')
			.withIndex('by_system', (q) => q.eq('isSystem', true))
			.first();

		if (existingExercises) {
			return { message: 'Exercises already seeded', count: 0 };
		}

		const systemExercises = [
			// Strength exercises
			{
				name: 'Push-ups',
				category: 'strength' as const,
				description: 'Classic upper body exercise targeting chest, shoulders, and triceps.',
				defaultDuration: 45
			},
			{
				name: 'Squats',
				category: 'strength' as const,
				description: 'Lower body exercise targeting quadriceps, hamstrings, and glutes.',
				defaultDuration: 45
			},
			{
				name: 'Lunges',
				category: 'strength' as const,
				description: 'Unilateral leg exercise for balance and lower body strength.',
				defaultDuration: 40
			},
			{
				name: 'Plank',
				category: 'strength' as const,
				description: 'Core stabilization exercise for abdominal and back muscles.',
				defaultDuration: 60
			},
			{
				name: 'Tricep Dips',
				category: 'strength' as const,
				description: 'Upper body exercise targeting triceps using body weight.',
				defaultDuration: 40
			},
			{
				name: 'Mountain Climbers',
				category: 'strength' as const,
				description: 'Full body exercise combining core work with cardio.',
				defaultDuration: 30
			},
			{
				name: 'Burpees',
				category: 'strength' as const,
				description: 'Full body explosive exercise for strength and conditioning.',
				defaultDuration: 45
			},
			{
				name: 'Crunches',
				category: 'strength' as const,
				description: 'Abdominal exercise targeting the rectus abdominis.',
				defaultDuration: 40
			},
			// Cardio exercises
			{
				name: 'Jumping Jacks',
				category: 'cardio' as const,
				description: 'Full body cardio exercise to elevate heart rate.',
				defaultDuration: 60
			},
			{
				name: 'High Knees',
				category: 'cardio' as const,
				description: 'Running in place with high knee lifts for cardio.',
				defaultDuration: 45
			},
			{
				name: 'Butt Kicks',
				category: 'cardio' as const,
				description: 'Running in place while kicking heels to glutes.',
				defaultDuration: 45
			},
			{
				name: 'Jump Rope',
				category: 'cardio' as const,
				description: 'Classic cardio exercise (with or without rope).',
				defaultDuration: 60
			},
			{
				name: 'Box Jumps',
				category: 'cardio' as const,
				description: 'Plyometric exercise jumping onto an elevated surface.',
				defaultDuration: 40
			},
			{
				name: 'Speed Skaters',
				category: 'cardio' as const,
				description: 'Lateral jumping exercise mimicking skating motion.',
				defaultDuration: 45
			},
			// Flexibility exercises
			{
				name: 'Hamstring Stretch',
				category: 'flexibility' as const,
				description: 'Static stretch for the back of the thighs.',
				defaultDuration: 30
			},
			{
				name: 'Quad Stretch',
				category: 'flexibility' as const,
				description: 'Static stretch for the front of the thighs.',
				defaultDuration: 30
			},
			{
				name: 'Shoulder Stretch',
				category: 'flexibility' as const,
				description: 'Cross-body stretch for shoulder mobility.',
				defaultDuration: 30
			},
			{
				name: 'Hip Flexor Stretch',
				category: 'flexibility' as const,
				description: 'Stretch for the hip flexors and psoas.',
				defaultDuration: 30
			},
			{
				name: 'Cat-Cow Stretch',
				category: 'flexibility' as const,
				description: 'Yoga-inspired spinal mobility exercise.',
				defaultDuration: 45
			},
			{
				name: 'Child Pose',
				category: 'flexibility' as const,
				description: 'Resting yoga pose for back and shoulder stretch.',
				defaultDuration: 45
			},
			{
				name: 'Downward Dog',
				category: 'flexibility' as const,
				description: 'Yoga pose stretching hamstrings, calves, and shoulders.',
				defaultDuration: 45
			},
			{
				name: 'Pigeon Pose',
				category: 'flexibility' as const,
				description: 'Deep hip opener yoga pose.',
				defaultDuration: 60
			}
		];

		let count = 0;
		for (const exercise of systemExercises) {
			await ctx.db.insert('exercises', {
				...exercise,
				isSystem: true,
				createdBy: undefined
			});
			count++;
		}

		return { message: 'Exercises seeded successfully', count };
	}
});
