module.exports = {
    config: {
        name: 'kick',
        aliases: ['kick', 'sacar', 'expulsar', 'remove'],
        description: 'Expulsar usuario del grupo',
        category: 'admin',
        premium: false,
        owner: false
    },
    
    handler: async (sock, m, { args, body, command, from, isGroup, user, pushName, global }) => {
        try {
            // Verificar que sea grupo
            if (!isGroup) {
                return sock.sendMessage(from, { text: global.msg?.group || '❌ Este comando solo funciona en grupos' });
            }

            // Verificar que el bot sea admin
            const groupMetadata = await sock.groupMetadata(from);
            const botJid = sock.user?.id;
            const botParticipant = groupMetadata.participants.find(p => p.id === botJid);
            const isBotAdmin = botParticipant?.admin || botParticipant?.superAdmin;

            if (!isBotAdmin) {
                return sock.sendMessage(from, { text: global.msg?.botAdmin || '❌ Necesito ser administrador' });
            }

            // Verificar si el usuario es el OWNER
            const senderJid = m.key?.fromMe ? sock.user?.id : m.key?.participant;
            const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
            const isOwner = ownerJids.includes(senderJid);

            // Si NO es owner, verificar que sea admin del grupo
            if (!isOwner) {
                const senderParticipant = groupMetadata.participants.find(p => p.id === senderJid);
                const isSenderAdmin = senderParticipant?.admin || senderParticipant?.superAdmin;

                if (!isSenderAdmin) {
                    return sock.sendMessage(from, { text: global.msg?.admin || '❌ Solo administradores pueden usar este comando' });
                }
            }

            // Obtener usuario a kickear
            let targetJid = null;

            // Si hay respuesta a un mensaje
            if (m.quoted?.sender) {
                targetJid = m.quoted.sender;
            }
            // Si hay mención en el mensaje
            else if (m.mentionedJid?.length > 0) {
                targetJid = m.mentionedJid[0];
            }
            // Si hay argumento con número
            else if (args[0]) {
                const mentioned = args[0].replace('@', '').replace(/\D/g, '') + '@s.whatsapp.net';
                targetJid = mentioned;
            }

            // Verificar que haya usuario
            if (!targetJid) {
                return sock.sendMessage(from, { 
                    text: '❌ *Uso:* .kick @usuario\n\nEtiqueta o responde a quien deseas expulsar.' 
                });
            }

            // No kickear al owner
            if (ownerJids.includes(targetJid)) {
                return sock.sendMessage(from, { text: '❌ No puedo expulsar al propietario del bot' });
            }

            // No kickear al bot
            if (targetJid === botJid) {
                return sock.sendMessage(from, { text: '❌ No puedo expulsarme a mí mismo' });
            }

            // Expulsar usuario
            await sock.groupParticipantsUpdate(from, [targetJid], 'remove');

            // Mensaje de confirmación
            const targetNum = targetJid.split('@')[0];
            await sock.sendMessage(from, { 
                text: `🚪 *Usuario expulsado*\n\n👤 @${targetNum} fue removido del grupo.\n\n✨ Powered by XPE-TEAM`,
                mentions: [targetJid]
            });

        } catch (error) {
            console.error('Error en comando kick:', error);
            await sock.sendMessage(from, { text: '❌ *Error al expulsar usuario*' });
        }
    }
}
