package MSOS::Base;
use utf8;
use open ':utf8';
use CGI qw(:cgi);
#
# Copyright Notice:
my $script_name = 'MSOS::Base';
my $script_vers = '14.3.27';
my $script_date = 'Mar. 3, 2014';
my $script_year = '2014';

#  Copyright© - OpenSiteMobile
my $copyright_year = '2008-2014';
#  All rights reserved

# ==========================================
# MobileSiteOS general config. settings and subroutines
# (don't edit unless you know what you are doing)
# ==========================================

my @date = localtime();
    $date[4]++;
    $date[5]+=1900;

my $doc_root = $ENV{'DOCUMENT_ROOT'};
   $doc_root =~ s/\/$//;    # Sometimes with '/', sometimes without

$defined = {

    'msos_cookie'	    => '',
    'msos_cookie_array'	=> '',
    'content_type'      => 'text/html; charset=utf-8',
    'cache_age'		    => 3600,
    'cookies_on'        => '',
    'display_detect'	=> 'na',
    'date_time'		    => "Date $date[4]-$date[3]-$date[5], Time $date[2]:$date[1]:$date[0]",
    'debug'		        => '',
    'debug_list'	    => '',
    'display'		    => 'phone',
    'os'                => $CGI::OS,
    'javascript_on'	    => '',
    'prior_cart'	    => undef,
    'prior_cart_cookie'	=> '',
    'results_list'	    => '',
    'prior_cart_flag'	=> 0,
    'template'		    => 'home',
    'user_status'       => '',

	# Set 'site_base_dir' to the folder path containing: ./msos, ./jquery, ./underscore, etc. (typically ./htdocs)
	'site_base_dir' => $doc_root,

    # Set 'site_base_url' to the url of the folder containing: ./jquery, ./msos, ./images, ./modernizr etc. (typically ./htdocs).
    'site_base_url'	=> 'http://' . $ENV{'SERVER_NAME'},

    # Application 'common folder' definitions
    'appl_templ_folder' => '/templates',
    'appl_img_folder'   => '/img',
    'appl_js_folder'    => '/js',
    'appl_img_sized'    => '/img/sized',

    # Application 'common file' definitions (must match actual values in config.js file)
    'appl_config_js'        => 'config.js',    # Must always be in the 'appl_js_folder' folder (ref. msos.get_script_location())
    'appl_config_img_json'  => 'config_images.json',

    # MobileSiteOS 'common folder' definitions 
    'msos_nls_folder'   => '/msos/nls',
    'msos_states_folder'=> '/msos/states',

    # MobileSiteOS 'common file' definitions
    'msos_base_js'      => 'msos/base.min.js',

    'msos' => {
        'company_alt'	=> 'OpenSiteMobile - Open Source Software for the Mobile Web',
        'company_name'	=> 'OpenSiteMobile',
        'company_email'	=> 'dwight@opensite.mobi',
        'company_url'	=> 'http://opensite.mobi',
    },

    'script_info' => {

		'name'			=> $script_name,
		'revision_date'	=> $script_date,
		'version'		=> $script_vers,
		'year'			=> $copyright_year,
    },

    # Form emailing information: defaults may work, if not enter your specific info
    'SMTP_email'	=> 'no',							# for sendmail:		'no'
    'SMTP_mailhost'	=> 'mail.' . $ENV{'HTTP_HOST'},		# or enter:			'mail.mycompany.mobi'
    'email_program'	=> &check_sendmail(),	            # path to sendmail:	'/usr/lib/sendmail'
    'email_to'		=> $ENV{'SERVER_ADMIN'},			# or enter:			'sales@mycompany.mobi'
    'email_from'	=> $ENV{'SERVER_ADMIN'},			# or enter:			'webmaster@mycompany.mobi'

    # Set to 'yes' if FLOCK is available on your server (optional)
    'use_flock' => 'no',

    'redirect_cgi' => {

        'site_media_cgi'    => 'site_media',
        'site_respns_cgi'   => 'site_response',
        'site_simple_cgi'   => 'site_simple',
        'site_tester_cgi'   => 'site_tester',
        'site_txtdspl_cgi'  => 'site_txt_display',
        'site_trblesh_cgi'  => 'site_troubleshooter',
        'site_wurfl_cgi'    => 'site_wurfl',
        'site_country_cgi'  => 'site_country_state',
        'site_translt_cgi'  => 'site_translate'
    }
};


#  BASE SUBROUTINES
# =========================================================

sub start_print {
# -----------------------------

	my $r = shift;
	my $dref = shift;

	my $output = qq~<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="utf-8" />
<meta name="handheldfriendly" content="true" />
<meta name="mobileoptimized"  content="width" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="Open source software for the mobile web!" />
<meta name="author" content="Dwight Vietzke" />

    <title>$dref->{'msos'}->{'company_alt'}</title>

<style type="text/css">
/* <![CDATA[ */

	html, body {
		background-color: #A1A1A1;
	}
	body {
		background-image: url($dref->{'site_base_url'}/images/grid_bg.png);
		background-repeat: repeat-x;
	}
	#body {
		display: none;
	}

	#no_javascript {
		background-color: #FFF;
		border: 2px solid #999;
		border-radius: 0.4em;
		margin-left: auto;
		margin-right: auto;
		width: 60%;
	}
	#no_javascript > i {
		color: red;
	}
    #copyright {
        margin: 0.2em;
        font-size: small;
    }
    #copyright > a {
        font-size: x-small;
    }

/* ]]> */
</style>

<link rel='shortcut icon' href='$dref->{'site_base_url'}/images/osm.ico' />

<script src="$dref->{'site_base_url'}/$dref->{'msos_base_js'}"></script>

<script>

msos.console.info('config -> start, (&MSOS::Base::start_print).');
msos.console.time('config');

// After page loads, display...
msos.onload_func_post.push(function () { jQuery('#body').css('display', 'block'); });

// --------------------------
// Stylesheets to load (CSS injection)
// --------------------------

if (msos.config.debug_css) {
	
	msos.deferred_css = [
		msos.resource_url('css', 'normalize.css'),
		msos.resource_url('css', 'fawe.css'),
		msos.resource_url('css', 'msos.css'),
		msos.resource_url('css', 'msos_bs.css'),
		msos.resource_url('css', 'msos_theme.css'),
	];

} else {

	msos.deferred_css = [
		msos.resource_url('css', 'bundle.min.css')
	];

}

// --------------------------
// Scripts to 'defer' load (script injection)
// --------------------------

if (msos.config.debug_script) {

	// Debug full scripts (line no's mean something)
    msos.deferred_scripts = [
		msos.resource_url('modernizr', 'v271.uc.js'),		// no class selectors - see build.txt note in /htdocs/modernizr
		msos.resource_url('jquery', 'v210.uc.js'),
		msos.resource_url('jquery', 'ui/v1104.uc.js'),		// All UI Core + Draggable Interaction + Effects Core
		msos.resource_url('underscore', 'v160.uc.js'),
		msos.resource_url('hammer', 'v106.uc.js'),			// jQuery.hammer.js version of Hammer.js
		msos.resource_url('backbone', 'v110.uc.js'),
		msos.resource_url('marionette', 'v123.uc.js'),
		msos.resource_url('msos', 'site.uc.js'),			// Common installation specific setup code (which needs jQuery, underscore.js, etc.)
		msos.resource_url('msos', 'core.uc.js')
	];

	if (!msos.config.json) {
		msos.deferred_scripts.push(msos.resource_url('utils', 'json2.uc.js'));
	}

} else {

	// Standard site provided (including ext. bundles) scripts
    msos.deferred_scripts = [
		msos.resource_url('msos', 'bundle.min.js'),			// Modernizr, jQuery, jQuery-UI, Hammer.js, Underscore, Backbone, Marionette bundled together
		msos.resource_url('msos', 'site.min.js'),
		msos.resource_url('msos', 'core.min.js')
	];

	if (!msos.config.json) {
		msos.deferred_scripts.push(msos.resource_url('utils', 'json2.min.js'));
	}
}

msos.css_loader(msos.deferred_css);
msos.script_loader(msos.deferred_scripts);

msos.console.info('config -> done!');
msos.console.timeEnd('config');

</script>

</head>

<body>

<noscript>
	<h3 id="no_javascript">
		<i class="fa fa-ban"></i> We're sorry, but this site requires JavaScript be enabled!
	</h3>
</noscript>

<div id='body'>
    <div id='marquee'>OpenSiteMobile</div>
    <div id='slogan'>Open source software for the mobile web!</div>

    <div id='header' class='msos_navbar'>
	$dref->{'navigate'}
    </div>
~;

	return $output;
}

sub end_print {
# -----------------------------

	my $r = shift;
	my $dref = shift;

	my $output = qq~

    <div id='footer' class='msos_navbar'>
    $dref->{'navigate'}
    </div>
    
    <div id='copyright'>
        Powered by:
        <a class='btn btn-msos' href='$dref->{'msos'}->{'company_url'}' title='Copyright©$dref->{'script_info'}->{'year'} $dref->{'msos'}->{'company_name'} - All rights reserved'>
            $dref->{'script_info'}->{'name'} v$dref->{'script_info'}->{'version'}
        </a>
    </div>

</div>
</body>
</html>
~;

	return $output;
}

sub missing_template {
# -----------------------------

	my $r = shift;
	my $dref = shift;

    my $http_accept = $ENV{"HTTP_ACCEPT"};

    $dref->{'user_status'} = "The page called via the 'page=" . $dref->{'template'} . "' query value is not available!";

    $http_accept =~ s/;/; /g;
    $http_accept =~ s/,/, /g;

    my  $temp_txt  = "<h2>Missing Template</h2>\n";
		$temp_txt .= "<div class='w_large'>\n<ul class='msos_list'>\n";
		$temp_txt .= "<li>Page (template): " . $dref->{'template'}		. "</li>\n";
		$temp_txt .= "<li>HTTP_USER_AGENT: " . $ENV{"HTTP_USER_AGENT"}	. "</li>\n";
		$temp_txt .= "<li>HTTP_ACCEPT: "	 . $http_accept		        . "</li>\n";
		$temp_txt .= "<li>JavaScript: "		 . $dref->{'javascript_on'}	. "</li>\n";
		$temp_txt .= "</ul>\n</div>";

	return &start_print($r, $dref) . $temp_txt . &end_print($r, $dref);
}

sub run_debugging {
# -----------------------------

	my $r = shift;
	my $dref = shift;

    my $output = '';

    if ($dref->{'debug'} eq 'die_test')  { die  "Testing 'die' and the CGI::Carp.pm module 'set_message' subroutine."; }
    if ($dref->{'debug'} eq 'warn_test') { warn "Testing 'warn' and the CGI::Carp.pm module."; }
    if ($dref->{'debug'} eq 'script_test') {

        require Data::Dumper;

        my $d = Data::Dumper->new([$dref], [qw(def *ary)]);

        $output = $d->Dump;
        $output = $r->escapeHTML($output);
        $output = "\tDebug Dump\n\n$output\n\n";

        &handle_errors("Testing the 'handle_error' subroutine!<br />\n<pre>$output</pre>", 'yes' );
    }
}

sub handle_errors {

	my $msg = shift;
	my $as_sub = shift || 'no';
	my $doctype = qq~<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="utf-8" />
<meta name="handheldfriendly" content="true" />
<meta name="mobileoptimized"  content="width" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
~;

    binmode(STDOUT, ":utf8");

    # CGI::Carp sends 'Content-type: text/html' automatically
    if ($as_sub eq 'yes') {
        print "Content-type: text/html; charset=utf-8\n\n";
    }
    print $doctype;
    print "<title>OpenSiteMobile</title>\n";
    print "\n</head>\n<body>\n";
    print "<h1>MobileSiteOS error message!</h1>";
    print "<p>$msg</p>\n";
    print "</body>\n</html>\n";
    if ($as_sub eq 'yes') { exit; }
}

sub gen_filehandle { local *FILEHANDLE; return *FILEHANDLE; }

sub open_write_file {
# -----------------------------

	my $fh = shift;
	my $full_file = shift;
	my $error_message = shift;
	my $print_text = shift || '';
	my $use_flock = shift || 'no';

	 open($fh, "> $full_file")	or &handle_errors( "Open Write File - $error_message<br />$!", 'yes' );
	flock($fh, 'LOCK_EX')		or &handle_errors( "Open Write File - FLOCK failed!<br />$!",  'yes' ) if $use_flock eq 'yes';

	print $fh $print_text;
}

sub open_file {
# --------------------------------------------------------

	my $fh = shift;
	my $full_file = shift;
	my $error_message = shift;
	my $raw_text = shift || 'no';

	my $line = '';
	my @input = ();

	unless ( -e $full_file )   { &handle_errors( "Open File - Unable to open file. The file does not exist!", 'yes'); }
	unless ( -r $full_file )   { &handle_errors( "Open File - Unable to read file. Read permissions are not granted!", 'yes'); }

	open($fh, "< $full_file") or &handle_errors( "Open File - Subroutine error!<br />$error_message<br />$!", 'yes');

	if ($raw_text eq 'no') {

		while ( defined($line = <$fh>) ) {

			if ($line =~ /^$/)    { next; }
			if ($line =~ /^\s*$/) { next; }
			if ($line =~ /^\s*#/) { next; }
			chomp $line;
			push (@input, $line);
		}
	} else {

		while (defined($line = <$fh>)) {
			push (@input, $line);
		}
	}

	close $fh or &handle_errors( "Open File - Unable to close file!<br />$!", 'yes');

	return \@input;
}

sub send_an_email {
# -----------------------------

	my $r = shift;
	my $dref = shift;

	my $to = shift;
	my $from = shift;
	my $subject = shift;
	my $message = shift;

	if ($dref->{'SMTP_email'} eq 'yes') {
		require Net::SMTP;

		my $smtp = Net::SMTP->new($dref->{'SMTP_mailhost'}) ||
            &MSOS::Base::handle_errors('Send an Email - SMTP program failed! (' . $dref->{'SMTP_mailhost'} . ')', 'yes');;

		$smtp->mail($from);
		$smtp->to($to);

		$smtp->data();
		$smtp->datasend("To: $to\n");
		$smtp->datasend("From: $from\n");
		$smtp->datasend("Subject: $subject\n\n");
		$smtp->datasend("\n");
		$smtp->datasend("$message\n");
		$smtp->dataend();

		$smtp->quit;
	} else {
		open(MAIL,"|$dref->{'email_program'} -t") ||
            &MSOS::Base::handle_errors('Send an Email - Sendmail program failed!', 'yes');
		print MAIL "To: $to\n";
		print MAIL "From: $from\n";
		print MAIL "Subject: $subject\n\n";
		print MAIL "$message\n";
		close(MAIL);
	}
}

sub check_page_avail {
# -----------------------------

	my $r = shift;
	my $dref = shift;

	my $available = 0;
	my $error = 'Check Page Avail - Unable to open/read dir ' . $dref->{'template_dir'} . '!';
	my @templates = ();

	opendir (USER_DIR, $dref->{'template_dir'}) or &handle_errors( $error . "<br />$!", 'yes');
	@templates = readdir(USER_DIR);
	closedir (USER_DIR);

	foreach (@templates) {
		if ($_ =~ m/^\./)			{ next; }
		if ($_ =~ m/^(.+)\.xhtml$/)	{ if ($dref->{'template'} eq $1) { $available = 1; } }
	}

	return $available;
}

sub check_ext {
# -----------------------------

	my $script_ext = '.cgi';

	if ($ENV{'SCRIPT_NAME'} =~ m/\.pl$/) {$script_ext = '.pl';}

	return $script_ext;
}

sub check_sendmail {
# -----------------------------

	my $sub_os = $CGI::OS || 'na';
	my $sendmail_path= '';
	my @mail = ();

	if ($sub_os =~ m/unix/i) {

		$sendmail_path = `whereis sendmail`;
		@mail=split(" ", $sendmail_path);
		foreach (@mail) {

            if($_ =~ m!^/usr/lib/sendmail$!)        {$sendmail_path = $_;}
            if($_ =~ m!^/usr/ucb/lib/sendmail$!)    {$sendmail_path = $_;}
            if($_ =~ m!^/usr/s?bin/sendmail$!)      {$sendmail_path = $_;}
		}
		unless($sendmail_path) {
            foreach (@mail) {
                if($_ =~ m!/sendmail$!)             {$sendmail_path = $_;}
            }
        }
	}

	return ( $sendmail_path || '/usr/lib/sendmail' );
}

sub validate_email {
# -----------------------------

	my $addr_to_check = shift;

	if (length($addr_to_check) > 100) { return ''; }

	$addr_to_check =~ s/("(?:[^"\\]|\\.)*"|[^\t "]*)[ \t]*/$1/g;

	my $esc         = '\\\\';
	my $space       = '\040';
	my $ctrl        = '\000-\037';
	my $dot         = '\.';
	my $nonASCII    = '\x80-\xff';
	my $CRlist      = '\012\015';
	my $letter      = 'a-zA-Z';
	my $digit       = '\d';

	my $atom_char   = qq{ [^$space<>\@,;:".\\[\\]$esc$ctrl$nonASCII] };
	my $atom        = qq{ $atom_char+ };
	my $byte        = qq{ (?: 1?$digit?$digit | 
							  2[0-4]$digit    | 
							 25[0-5]         )
			};
	my $qtext       = qq{ [^$esc$nonASCII$CRlist"] };
	my $quoted_pair = qq{ $esc [^$nonASCII] };
	my $quoted_str  = qq{ " (?: $qtext | $quoted_pair )* " };

	my $word        = qq{ (?: $atom | $quoted_str ) };
	my $ip_address  = qq{ \\[ $byte (?: $dot $byte ){3} \\] };
	my $sub_domain  = qq{ [$letter$digit]
						  [$letter$digit-]{0,61} [$letter$digit]};
	my $top_level   = qq{ (?: $atom_char ){2,4} };
	my $domain_name = qq{ (?: $sub_domain $dot )+ $top_level };
	my $domain      = qq{ (?: $domain_name | $ip_address ) };
	my $local_part  = qq{ $word (?: $dot $word )* };
	my $address     = qq{ $local_part \@ $domain };

	if ($addr_to_check =~ /^$address$/x)	{ return $addr_to_check;	}
	else									{ return '';				}
}

sub run_cgi_redirect {
# -----------------------------

	my $r = shift;
	my $dref = shift;
	my $script = $dref->{'run_site_cgi'} || 'na';
	my $display = $r->param('display_cgi') || '';

    # Make sure it is a valid script name
    if ($dref->{'redirect_cgi'}->{$script}) {

        my $cgi_script = $dref->{'redirect_cgi'}->{$script} . &check_ext();

		# Special cases...
        if ($script eq 'site_media_cgi' && $dref->{'site_appl_rel_path'}) {
            $cgi_script .= '?application_rel_path=' . CGI::escape($dref->{'site_appl_rel_path'});
        }

		if ($script eq 'site_txtdspl_cgi' && $display) {
			$cgi_script .= '?display_cgi=' . CGI::escape($display);
		}

        print redirect($cgi_script);

    } else {

        &handle_errors('Run CGI Redirect - failed, unknown script reference: ' . $script, 'yes');
    }
}

sub debug_dump {
# -----------------------------

	my $dref = shift;
	my $dump = shift;		# -- perl array or hash scalar

    my $app_dir = $dref->{'site_appl_rel_path'} || '';
	my $d = '';
	my $dump_path = '';
	my $output = '';

	$dump_path = $dref->{'site_base_dir'} . $app_dir . '/debug_dump.txt';

	require Data::Dumper;

	$d = Data::Dumper->new([$dump], [qw(dump *ary)]);
	$output = $d->Dump;

	$output = "#\tDebug Dump\n\n$output\n\n";

	my $fh = &gen_filehandle();

	&open_write_file(
		$fh,
		$dump_path,
		'Debug dump failed:',
		$output,
		$dref->{'use_flock'}
	);
}

sub TimestampISO8601 {
# -----------------------------

	my($t) = @_;
	# Seconds since epoch (1970-01-01) --> ISO 8601 time string.

	my($sec, $min, $hour, $day, $mon, $year) = gmtime($t);
	$year += 1900;
	$mon += 1;

	foreach my $datetime_element ($sec, $min, $hour, $day, $mon) {
		if (length($datetime_element) < 2) {
			$datetime_element = '0' . $datetime_element;
		}
	}

	return "$year-$mon-$day" . 'T' . "$hour:$min:$sec" . 'Z';
}

sub set_permissions {

    my $perm = shift;
    my $path = shift;
    my $warn = shift;

    chmod $perm, $path or warn "$warn $perm - $path - $!";
};


1;